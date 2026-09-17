import { TokenType } from "#/common/enum/enum.js";
import { config } from "#/configuration/_index.js";

export const getSignature = ({ tokenType = TokenType.ACCESS }) => (tokenType == TokenType.ACCESS) ? config.ACCESS_USER_TOKEN_SECRET : config.REFRESH_TOKEN_SECRET

export const getTokenSignature = () => {

}