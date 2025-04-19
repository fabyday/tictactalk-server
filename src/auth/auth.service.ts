import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  private users = [
    { id: 1, username: 'test', password: '1234' },
    { id: 2, username: 'john', password: 'abcd' },
  ];
  private idCounter = 2;

  async validateUser(username: string, password: string) {
    const user = this.users.find(
      (u) => u.username === username && u.password === password,
    );
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return { id: user.id, username: user.username };
  }
  async register(username: string, password: string) {
    const exists = this.users.find((u) => u.username === username);
    if (exists) throw new ConflictException('Username already exists');

    const newUser = { id: this.idCounter++, username, password };
    this.users.push(newUser);
    return { message: 'Registered successfully' };
  }

  async login(user: any) {
    const payload = { sub: user.id, username: user.username };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
