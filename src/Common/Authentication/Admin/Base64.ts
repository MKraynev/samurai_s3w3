

export class Base64 {
    static Decode64 = (str: string): string => Buffer.from(str, 'base64').toString('binary');
    static Encode64 = (str: string): string => Buffer.from(str, 'binary').toString('base64');

    static ValidBase64Key = (encodedKeyValue: string, expectedValue: string): boolean => {
        if (encodedKeyValue.startsWith("Basic ")) {
            let expectedKeyVal = this.Encode64(expectedValue);
            let keyFromRequest = encodedKeyValue.slice(6);

            if (keyFromRequest === expectedKeyVal)
                return true;
        }
        return false;
    };
}
