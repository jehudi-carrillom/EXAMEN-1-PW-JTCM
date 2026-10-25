import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { SqliteService } from '../sqlite/sqlite.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(private readonly sqlite: SqliteService) {}

  onModuleInit() {
    this.sqlite.exec(`
      CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        lastname TEXT,
        age INTEGER NOT NULL CHECK (age BETWEEN 1 AND 115)
      )
    `);
  }

  // "jehudi TOMAS" -> "Jehudi Tomas"
  private capitalize(text: string) {
    const t = text.trim();
    return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
  }

  // Valida y deja los datos listos para guardar
  private clean(dto: CreateUserDto) {
    if (typeof dto.name !== 'string' || !dto.name.trim()) {
      throw new BadRequestException('El nombre es requerido');
    }
    if (dto.lastname != null && typeof dto.lastname !== 'string') {
      throw new BadRequestException('El apellido debe ser texto');
    }
    if (!Number.isInteger(dto.age) || dto.age < 1 || dto.age > 115) {
      throw new BadRequestException('La edad debe ser un entero entre 1 y 115');
    }
    return {
      name: this.capitalize(dto.name),
      lastname: dto.lastname?.trim() ? this.capitalize(dto.lastname) : null,
      age: dto.age,
    };
  }

  create(dto: CreateUserDto) {
    const u = this.clean(dto);
    const result = this.sqlite.run(
      'INSERT INTO user (name, lastname, age) VALUES (?, ?, ?)',
      [u.name, u.lastname, u.age],
    );
    return this.findOne(Number(result.lastInsertRowid));
  }

  findAll() {
    return this.sqlite.all<User>('SELECT * FROM user');
  }

  findOne(id: number) {
    const user = this.sqlite.get<User>('SELECT * FROM user WHERE id = ?', [id]);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  update(id: number, dto: UpdateUserDto) {
    this.findOne(id);
    const u = this.clean(dto);
    this.sqlite.run(
      'UPDATE user SET name = ?, lastname = ?, age = ? WHERE id = ?',
      [u.name, u.lastname, u.age, id],
    );
    return this.findOne(id);
  }

  remove(id: number) {
    const user = this.findOne(id);
    this.sqlite.run('DELETE FROM user WHERE id = ?', [id]);
    return user;
  }
}