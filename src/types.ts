export enum LiteralType {
    StringLiteral = "StringLiteral",
    BooleanLiteral = "BooleanLiteral",
    FloatLiteral = "FloatLiteral",
    DoubleLiteral = "DoubleLiteral",
    DecimalLiteral = "DecimalLiteral"
}

export interface AnnotationPropertyNode {
    name: String;
    value: String | Number | Boolean;
    literalType: LiteralType;
}

export interface AnnotationNode {
    name: String;
    properties: AnnotationPropertyNode[];
}

export interface ClassNode {
    name: String;
    annotations: AnnotationNode[];
}