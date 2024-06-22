let accessToken = null;
let tokenExpiry = null;

const gettoken = async(req, res, next)=>{
    try{
        
        return {
            accessToken: accessToken,
            tokenExpiry: tokenExpiry
        }   
        
    }catch (err){
        return res.status(500).send({error:err.message})
    }
}

const newtoken = async(req, res, next)=>{
    try{
        accessToken = "test";
        tokenExpiry = "test";
        return {
            accessToken: accessToken,
            tokenExpiry: tokenExpiry
        }   
        
    }catch (err){
        return res.status(500).send({error:err.message})
    }
}

module.exports = {gettoken,newtoken}