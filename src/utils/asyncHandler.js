

//1.  by promises

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req,res,next)).catch(next);
    }
}

export default asyncHandler;

// 2. by try catch