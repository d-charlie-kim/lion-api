import {
	Controller,
	Get,
	Headers,
	Header,
	HttpException,
	HttpStatus,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller()
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@UseGuards(LocalAuthGuard)
	@Post('user/login')
	async logIn(@Req() req) {
		try {
			const jwt = await this.authService.login(req.user);

			return {
				user: {
					...req.user,
					token: jwt.accessToken,
				},
			};
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			} else {
				throw new HttpException('잘못된 접근입니다.', HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}
	}

	@Get('user/checktoken')
	@Header('content-type', 'application/json')
	async checkToken(@Req() req, @Headers('Authorization') authorization: string) {
		if (!authorization || !authorization.startsWith('Bearer ')) {
			return { isValid: false };
		}
		const token = authorization.split(' ')[1];
		const isValid = this.authService.validateToken(token);
		return { isValid };
	}
}
