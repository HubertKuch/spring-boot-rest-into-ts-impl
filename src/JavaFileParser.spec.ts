import {JavaFileParser} from "./JavaFileParser";
import {AnnotationPropertyNode, LiteralType} from "./types";

describe('JavaFileParser', () => {
    const sampleParser = new JavaFileParser(`
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

    it('should get all classes in file', () => {
        const classNodes = sampleParser.getAllClasses();

        expect(classNodes.length).toEqual(2);
        expect(classNodes[0].name).toEqual("Controller");
        expect(classNodes[1].name).toEqual("SomeNextClass");
    });

    it('should get properly class annotations', () => {
        const classNodes = sampleParser.getAllClasses();

        expect(classNodes[0].annotations.length).toEqual(1);
        expect(classNodes[0].annotations[0].name).toEqual("RestController");

        expect(classNodes[0].annotations[0].properties.length).toEqual(5);

        const CONTROLLER_CLASS_ANNOTATION_PROPERTIES: AnnotationPropertyNode[] = [
            {name: "something", value: "test", literalType: LiteralType.StringLiteral},
            {name: "something2", value: 2, literalType: LiteralType.DecimalLiteral},
            {name: "something3", value: true, literalType: LiteralType.BooleanLiteral},
            {name: "something4", value: 4, literalType: LiteralType.FloatLiteral},
            {name: "something5", value: 4, literalType: LiteralType.FloatLiteral},
        ]

        expect(classNodes[0].annotations[0].properties[0].name).toEqual("something");
        expect(classNodes[0].annotations[0].properties).toEqual(CONTROLLER_CLASS_ANNOTATION_PROPERTIES);
    });

    it('should get all methods from class when has', () => {
        const classNodes = sampleParser.getAllClasses();
        const methods = classNodes[0].methods;

        expect(methods.length).toEqual(1);
        expect(methods[0].name).toEqual("get");
        expect(methods[0].returns).toEqual("Response");
        expect(methods[0].annotations.length).toEqual(1);
    });
});