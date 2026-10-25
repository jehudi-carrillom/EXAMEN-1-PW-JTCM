  import { Injectable } from '@nestjs/common';
   import { SqliteService } from '../sqlite/sqlite.service';

   @Injectable()
   export class ReportsService {
     constructor(private readonly sqlite: SqliteService) {}

     paymentsPerUser() {
       return this.sqlite.all(`
         SELECT u.id AS user_id, u.name, u.lastname,
                p.id AS payment_id, p.amount, p.moneda, p.datetime
         FROM user u
         LEFT JOIN payment p ON p.user_id = u.id
       `);
     }

     paymentsWithIva() {
       return this.sqlite.all(`
         SELECT p.*, ROUND(p.amount * 1.13, 2) AS net_amount
         FROM payment p
       `);
     }
   }