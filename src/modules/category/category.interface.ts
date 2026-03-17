export interface ICreateCategoryPayload {
    name: string
    slug: string
}

export interface IUpdateCategoryPayload {
    name?: string
    slug?: string
}