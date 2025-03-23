export enum LiteralType {
    StringLiteral = "StringLiteral",
    BooleanLiteral = "BooleanLiteral",
    FloatLiteral = "FloatLiteral",
    DoubleLiteral = "DoubleLiteral",
    DecimalLiteral = "DecimalLiteral"
}

interface Nameable {
    name: string;
}

interface Valuable {
    value: string | Number | Boolean;
}

interface HasAnnotations {
    annotations: AnnotationNode[];
}

export interface AnnotationPropertyNode extends Valuable, Nameable {
    literalType: LiteralType;
}

export interface AnnotationNode extends Nameable {
    properties: AnnotationPropertyNode[];
}

interface MethodPropertyNode extends Nameable, Valuable {
}

export interface MethodNode extends Nameable, HasAnnotations {
    properties: MethodPropertyNode[];
    returns: string;
}

export interface ClassNode extends Nameable, HasAnnotations {
    methods: MethodNode[];
}