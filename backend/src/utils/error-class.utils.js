


export class ErrorHandlerClass{
    constructor(message,stausCode,stack,position,data){
        this.message = message;
        this.stausCode = stausCode;
        this.stack = stack?stack : null;
        this.position = position?position:"Unknown";
        this.data = data?data : null ;
    }
} 