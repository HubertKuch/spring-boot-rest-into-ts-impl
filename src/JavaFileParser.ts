import {
    AnnotationCstNode,
    ClassDeclarationCstNode,
    CompilationUnitCstNode,
    ElementValuePairCstNode,
    parse
} from "java-parser";
import {JSONPath} from "jsonpath-plus";
import {AnnotationNode, AnnotationPropertyNode, ClassNode, LiteralType} from "./types";

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
            const className: String = JSONPath({
                path: "$..normalClassDeclaration[0]..typeIdentifier[0]..image",
                json: classNode
            })[0];

            return {name: className, annotations: this.getAnnotationsFromClassNode(classNode)}
        })
    }

    private getAnnotationsFromClassNode(classNode: ClassDeclarationCstNode): AnnotationNode[] {
        return JSONPath({path: "$..classModifier[0]..[?(@.name=='annotation')]", json: classNode})
            .map((annNode: AnnotationCstNode) => {
                const annName = JSONPath({path: "$..typeName..image", json: annNode})[0];
                const properties = this.getAnnotationProperties(annNode);

                return {name: annName, properties};
            })
    }

    private getAnnotationProperties(annotationNode: AnnotationCstNode): AnnotationPropertyNode[] {
        return JSONPath({
            path: "$..elementValuePair..[?(@.name=='elementValuePair')]",
            json: annotationNode
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