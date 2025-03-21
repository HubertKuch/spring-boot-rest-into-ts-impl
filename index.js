"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const java_parser_1 = require("java-parser");
const jsonpath_plus_1 = require("jsonpath-plus");
class JavaFileParser {
    constructor(content) {
        this.cst = (0, java_parser_1.parse)(content);
        this.getAllClassDeclarations();
    }
    getAllClassDeclarations() {
        const classNodes = (0, jsonpath_plus_1.JSONPath)({ path: "$..[?(@.name=='classDeclaration')]", json: this.cst });
        classNodes.map((classNode) => {
            console.log(this.getAnnotationsFromClassNode(classNode));
        });
    }
    getAnnotationsFromClassNode(classNode) {
        return (0, jsonpath_plus_1.JSONPath)({ path: "$..classModifier[0]..[?(@.name=='annotation')]", json: classNode })
            .map((annNode) => {
            const annName = (0, jsonpath_plus_1.JSONPath)({ path: "$..typeName..image", json: annNode })[0];
            const properties = this.getAnnotationProperties(annNode);
            return { name: annName, properties };
        });
    }
    getAnnotationProperties(annotationNode) {
        return (0, jsonpath_plus_1.JSONPath)({
            path: "$..elementValuePair..[?(@.name=='elementValuePair')]",
            json: annotationNode
        }).map((property) => {
            const key = (0, jsonpath_plus_1.JSONPath)({ path: "$..Identifier..image", json: property })[0];
            const literalType = (0, jsonpath_plus_1.JSONPath)({ path: "$..literal..tokenType..name", json: property })[0];
            let value = (0, jsonpath_plus_1.JSONPath)({ path: "$..elementValue..image", json: property })[0];
            if (literalType === "FloatLiteral" || literalType === "DoubleLiteral") {
                value = value.replace("f", "").replace("d", "").replace("D", "").replace("F", "");
            }
            try {
                value = JSON.parse(value);
            }
            catch (e) {
            }
            return { literalType, key, value };
        });
    }
}
new JavaFileParser(`
    @RestController(something="test", something2=2, something3=true, something4=4.0f, something5=4.0d)
    public class Controller {
        
        @GetMapping
        public Response get() {
            return new Response("...", "><");
        }
        
        private record Response(String id, String name){} 
    }
    
    public class SomeNextClass {
    
    }
`);
