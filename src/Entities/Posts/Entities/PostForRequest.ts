export class PostRequest {
    constructor(
        public title: string,
        public shortDescription: string,
        public content: string,
        public blogId: string,
        public blogName: string| undefined = undefined) { }
}