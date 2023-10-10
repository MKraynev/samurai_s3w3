export class UserRequest {
    constructor(
        public login: string,
        public password: string,
        public email: string,
        public emailConfirmed: boolean = false) { }
}