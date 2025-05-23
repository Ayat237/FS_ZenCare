import { ErrorHandlerCalss } from "../utils/index.js";

const reqKeys = ['body', 'headers', 'query', 'params','file','files']

export const validation = (shcema)=>{
    return (req, res, next) => {
        const validationErrors =[];
        for (const key of reqKeys) {
            const validationResult = shcema[key]?.validate(req[key],{abortEarly: false});
            if (validationResult?.error) {
                validationErrors.push(validationResult.error.details);
            }   
        }
        if (validationErrors.length) {
            return next(new ErrorHandlerCalss("Validation Error",400,validationErrors ));
        }
        next();
    }
 
}