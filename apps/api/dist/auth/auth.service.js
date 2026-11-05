"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const bcrypt = require("bcrypt");
let AuthService = class AuthService {
    usersService;
    jwtService;
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async validateUser(email, password) {
        const user = await this.usersService.findByEmail(email);
        if (!user || !user.passwordHash) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.deletedAt) {
            throw new common_1.UnauthorizedException('Account has been deleted');
        }
        return user;
    }
    async login(email, password) {
        const user = await this.validateUser(email, password);
        const payload = {
            sub: user.id.toString(),
            email: user.email,
            role: user.role,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
            },
        };
    }
    async register(data) {
        const existingUser = await this.usersService.findByEmail(data.email);
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await this.usersService.create({
            name: data.name,
            email: data.email,
            passwordHash: hashedPassword,
            role: data.role || 'CUSTOMER',
        });
        if (data.role === 'CUSTOMER' || !data.role) {
            await this.usersService.createClientProfile(user.id.toString());
        }
        const payload = {
            sub: user.id.toString(),
            email: user.email,
            role: user.role,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    }
    async validateToken(token) {
        try {
            const payload = this.jwtService.verify(token);
            const user = await this.usersService.findById(payload.sub);
            if (!user || user.deletedAt) {
                throw new common_1.UnauthorizedException('Invalid token');
            }
            return user;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map