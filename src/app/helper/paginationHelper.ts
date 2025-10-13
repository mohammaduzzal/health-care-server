export type IOptions = {
    page?: string | number,
    limit?: string | number,
    sortby?: string,
    sortOrder?: string,
}

type IOptionsResult = {
    page : number,
    limit : number,
    skip : number,
    sortby : string,
    sortOrder : string
}


const calculatePagination = (options: IOptions) : IOptionsResult => {
    const page: number = Number(options.page) || 1
    const limit: number = Number(options.limit) || 10
    const skip: number = (Number(page) - 1) * limit

    const sortby: string = options.sortby || "createdAt"
    const sortOrder: string = options.sortOrder || "desc"

    return {
        page,
        limit,
        skip,
        sortby,
        sortOrder
    }
}


export const paginationHelper = {
    calculatePagination
}