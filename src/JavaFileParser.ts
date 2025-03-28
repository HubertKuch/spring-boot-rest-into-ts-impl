import {
    AnnotationCstNode,
    ClassDeclarationCstNode,
    CompilationUnitCstNode, CstNode,
    ElementValuePairCstNode, MethodDeclarationCstNode,
    parse
} from "java-parser";
import {JSONPath} from "jsonpath-plus";
import {AnnotationNode, AnnotationPropertyNode, ClassNode, LiteralType, MethodNode} from "./types";

export class JavaFileParser {
    private readonly cst: CompilationUnitCstNode;

    constructor(content: string) {
        this.cst = parse(content) as CompilationUnitCstNode;
        this.getAllClasses();
    }

    getAllClasses(): ClassNode[] {
        const classNodes: ClassDeclarationCstNode[] = JSONPath({
            path: "$..[?(@.name=='classDeclaration')]",
            json: this.cst
        });


        return classNodes.map((classNode: ClassDeclarationCstNode) => {
            const className: string = JSONPath({
                path: "$..normalClassDeclaration[0]..typeIdentifier[0]..image",
                json: classNode
            })[0];

            return {
                name: className,
                annotations: this.getAnnotationFromClassModifier(classNode),
                methods: this.getMethodsFromClassNode(classNode)
            }
        })
    }

    private getMethodsFromClassNode(classNode: ClassDeclarationCstNode): MethodNode[] {
        return JSONPath({path: "$..classBodyDeclaration[0]..methodDeclaration", json: classNode})
            .map((methodNode: MethodDeclarationCstNode) => {
                const methodName = JSONPath({
                    path: "$..methodHeader..methodDeclarator..Identifier..image",
                    json: methodNode
                })[0];

                const annotations = this.getAnnotationFromMethodModifier(JSONPath({
                    json: methodNode,
                    path: "$..methodModifier"
                }));

                const properties = this.getProperties(JSONPath({
                    path: "$..methodHeader..methodDeclarator..formalParameterList",
                    json: methodNode
                }));

                const returns = JSONPath({path: "$..unannType..image", json: methodNode})[0];

                return {name: methodName, returns, annotations, properties};
            });
    }

    private getAnnotationFromClassModifier(node: CstNode): AnnotationNode[] {
        return JSONPath({path: "$..classModifier[0]..[?(@.name=='annotation')]", json: node})
            .map((annNode: AnnotationCstNode) => {
                const annName = JSONPath({path: "$..typeName..image", json: annNode})[0];
                const properties = this.getProperties(annNode);

                return {name: annName, properties};
            })
    }

    private getAnnotationFromMethodModifier(node: CstNode): AnnotationNode[] {
        return JSONPath({path: "$..[?(@.name=='annotation')]", json: node})
            .map((annNode: AnnotationCstNode) => {
                const annName = JSONPath({path: "$..typeName..image", json: annNode})[0];
                const properties = this.getProperties(annNode);

                return {name: annName, properties};
            })
    }

    private getProperties(node: CstNode): AnnotationPropertyNode[] {
        return JSONPath({
            path: "$..elementValuePair..[?(@.name=='elementValuePair')]",
            json: node
        }).map((property: ElementValuePairCstNode) => {
            const name = JSONPath({path: "$..Identifier..image", json: property})[0];
            const rawLiteral: string = JSONPath({path: "$..literal..tokenType..name", json: property})[0];
            let value = JSONPath({path: "$..elementValue..image", json: property})[0];

            if (rawLiteral === "FloatLiteral" || rawLiteral === "DoubleLiteral") {
                value = value.replace("f", "").replace("d", "").replace("D", "").replace("F", "");
            }

            try {
                value = JSON.parse(value);
            } catch (e) {
            }

            const literalType: LiteralType = ["True", "False"].includes(rawLiteral)
                ? LiteralType.BooleanLiteral
                // @ts-ignore
                : LiteralType[rawLiteral];

            return {literalType, name, value};
        });
    }
}