export interface ICredentials {
    userid:       string;
    password:     string;
    database:     string;
    keepsignedin: string;
}

export interface IToken {
    Token: string;
}

export interface IJwtToken {
    iat:       number;
    iss:       string;
    exp:       number;
    userid:    string;
    database:  string;
    role:      string;
    firstname: string;
    lastname:  string;
    lidnr:     string;
}
