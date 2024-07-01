import {
  Entity, PrimaryGeneratedColumn, Column, Repository,
} from 'typeorm';
import { AppDataSource } from '../app-data-source';

@Entity()
export default class User {
  private readonly _userRepository: Repository<User>;

    @PrimaryGeneratedColumn()
      _id: number;

    @Column({ nullable: true })
      _name: string;

    @Column({ nullable: true })
      _email: string;

    constructor() {
      this._userRepository = AppDataSource.getRepository(User);
    }

    save() {
      return this._userRepository.save(this);
    }

    remove() {
      return this._userRepository.remove(this);
    }

    get userRepository(): Repository<User> {
      return this._userRepository;
    }

    get id(): number {
      return this._id;
    }

    get name(): string {
      return this._name;
    }

    set name(value: string) {
      this._name = value;
    }

    get email(): string {
      return this._email;
    }

    set email(value: string) {
      this._email = value;
    }
}
