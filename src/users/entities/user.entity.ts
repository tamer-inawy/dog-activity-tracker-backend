import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
// import { Dog } from '../../dogs/entities/dog.entity';
// import { Activity } from '../../activities/entities/activity.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // @OneToMany(() => Dog, (dog) => dog.user, { cascade: true })
  // dogs: Dog[];

  // @OneToMany(() => Activity, (activity) => activity.user, { cascade: true })
  // activities: Activity[];
}
