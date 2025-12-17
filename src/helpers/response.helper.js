export const successResponse = (res, message, data = {}, status = 200) => {
   return res.status(status).json({
     success: true,
     message,
     data,
   });
 };
 
 export const errorResponse = (res, message, status = 400, errors = null) => {
   return res.status(status).json({
     success: false,
     message,
     errors,
   });
 };
 