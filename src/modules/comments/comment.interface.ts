export interface ICreateCommentPayload {
    content: string,
    ideaId: string
    parentId: string
}
export interface IUpdateComment {
    content: string
    parentId: string
}