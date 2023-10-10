import { Page } from "./Page";

export class Paginator {
    constructor(
        public pageNumber: number = 1,
        public pageSize: number = 10,
        public pagesCount: number = 0,
        public page: number = 0,
        public totalCount: number = 0
    ) {
        if ((!pageNumber) || pageNumber <= 0 || isNaN(pageNumber)) {
            this.pageNumber = 1;
        }
        if ((!pageSize) || pageSize <= 0 || isNaN(pageSize)) {
            this.pageSize = 10;
        }
    }

    GetPaged<T>(obj: T): Page<T> {
        return new Page<T>(this.pagesCount, this.page, this.pageSize, this.totalCount, obj)
    }

    public GetAvailableSkip(totalCount: number): number {
        if (totalCount > this.pageSize) {
            let maxPages = Math.ceil(totalCount / this.pageSize);
            this.page = Math.min(maxPages, this.pageNumber);
            this.pagesCount = maxPages;
            this.totalCount = totalCount;

            return (this.page - 1) * this.pageSize;
        }

        this.page = 1;
        this.pagesCount = 1;
        this.pagesCount = 1;

        return 0;
    }
}