export class AuthRequest{
    constructor(
        public loginOrEmail: string,
        public password: string
    ){}
}