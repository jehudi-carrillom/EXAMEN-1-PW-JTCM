import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { SqliteService } from '../sqlite/sqlite.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService implements OnModuleInit {
  constructor(private readonly sqlite: SqliteService) {}

  onModuleInit() {
    this.sqlite.exec(`
      CREATE TABLE IF NOT EXISTS payment (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES user(id) ON DELETE CASCADE,
        amount REAL NOT NULL CHECK (amount BETWEEN 0 AND 100000),
        moneda TEXT NOT NULL CHECK (moneda IN ('USD', 'CRC')),
        datetime TEXT NOT NULL
      )
    `);
  }

  private validate(dto: CreatePaymentDto) {
    if (!Number.isInteger(dto.user_id)) {
      throw new BadRequestException('user_id es requerido y debe ser entero');
    }
    if (!this.sqlite.get('SELECT id FROM user WHERE id = ?', [dto.user_id])) {
      throw new BadRequestException('El usuario no existe');
    }
    if (typeof dto.amount !== 'number' || dto.amount < 0 || dto.amount > 100000) {
      throw new BadRequestException('amount debe ser un número entre 0 y 100000');
    }
    if (dto.moneda !== 'USD' && dto.moneda !== 'CRC') {
      throw new BadRequestException("moneda debe ser 'USD' o 'CRC'");
    }
  }

  create(dto: CreatePaymentDto) {
    this.validate(dto);
    const result = this.sqlite.run(
      'INSERT INTO payment (user_id, amount, moneda, datetime) VALUES (?, ?, ?, ?)',
      [dto.user_id, dto.amount, dto.moneda, new Date().toISOString()], // hora del back-end
    );
    return this.findOne(Number(result.lastInsertRowid));
  }

  findAll() {
    return this.sqlite.all('SELECT * FROM payment');
  }

  findOne(id: number) {
    const p = this.sqlite.get('SELECT * FROM payment WHERE id = ?', [id]);
    if (!p) throw new NotFoundException('Pago no encontrado');
    return p;
  }

  update(id: number, dto: UpdatePaymentDto) {
    this.findOne(id);
    this.validate(dto);
    this.sqlite.run(
      'UPDATE payment SET user_id = ?, amount = ?, moneda = ? WHERE id = ?',
      [dto.user_id, dto.amount, dto.moneda, id],
    );
    return this.findOne(id);
  }

  remove(id: number) {
    const p = this.findOne(id);
    this.sqlite.run('DELETE FROM payment WHERE id = ?', [id]);
    return p;
  }
}