import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
    bcrypt_salt_round: process.env.BCRYPT_SALT_ROUND,
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLODE_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    },
    jwt: {
        jwt_access_secret: process.env.JWT_ACCESS_SECRET,
        jwt_access_expire : process.env.JWT_ACCESS_EXPIRE,
        jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
        jwt_refresh_expire : process.env.JWT_REFRESH_EXPIRE,
        reset_pass_secret : process.env.RESET_PASS_SECRET,
        reset_pass_token_expires_in : process.env.RESET_PASS_TOKEN_EXPIRE_IN
    },
    openRouterApiKey : process.env.OPENROUTER_API_KEY,
    stripe:{
        stripe_secret_key : process.env.STRIPE_SECRET_KEY,
        client_url : process.env.CLIENT_URL,
        stripe_webhook_secret : process.env.STRIPE_WEBHOOK_SECRET
    },
    emailSender :{
        email : process.env.EMAIL,
        app_pass : process.env.APP_PASS
    },
    reset_pass_link : process.env.RESET_PASS_LINK
}