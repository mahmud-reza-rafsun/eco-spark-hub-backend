export interface ICreateIdeaPayload {
    title: string
    problem: string
    solution: string
    description: string
    price: number
    images: string,
    categoryId: string
}

export interface IUpdateIdeaPayload {
    title: string
    problem: string
    solution: string
    description: string
    price: number,
    images: string,
}