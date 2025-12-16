import { User as UserPrisma } from '@prisma/client';
import { Role } from '../types';

export class User {
    readonly id?: number;
    readonly username: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly password: string;
    readonly role?: Role;
    readonly isVerified?: boolean;
    readonly verificationToken?: string;
    readonly mfaCode?: string;
    readonly mfaExpires?: Date;
    readonly resetToken?: string;
    readonly resetTokenExpires?: Date 

    constructor(user: {
        id?: number;
        username: string;
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        role: Role;
        isVerified?: boolean;
        verificationToken?: string;
        mfaCode?: string;
        mfaExpires?: Date;
        resetToken?: string;
        resetTokenExpires?: Date 
    }) {
        this.validate(user);

        this.id = user.id;
        this.username = user.username;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.email = user.email;
        this.password = user.password;
        this.role = user.role;
        this.isVerified = user.isVerified;
        this.verificationToken = user.verificationToken;
        this.mfaCode = user.mfaCode;
        this.mfaExpires = user.mfaExpires;
        this.resetToken = user.resetToken;
        this.resetTokenExpires = user.resetTokenExpires;
    }

    validate(user: {
        username: string;
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        role: Role;
    }) {
        if (!user.username?.trim()) {
            throw new Error('Username is required');
        }
        if (!user.firstName?.trim()) {
            throw new Error('First name is required');
        }
        if (!user.lastName?.trim()) {
            throw new Error('Last name is required');
        }
        if (!user.email?.trim()) {
            throw new Error('Email is required');
        }
        if (!user.password?.trim()) {
            throw new Error('Password is required');
        }
        if (!user.role) {
            throw new Error('Role is required');
        }
    }

    get fullname(): string {
        return `${this.lastName} ${this.firstName}`;
    }

    equals({ id, username, firstName, lastName, email, password, role }): boolean {
        return (
            this.id === id &&
            this.username === username &&
            this.firstName === firstName &&
            this.lastName === lastName &&
            this.email === email &&
            this.password === password &&
            this.role === role
        );
    }

    static from({ id, username, firstName, lastName, email, password, role, isVerified, verificationToken, mfaCode, mfaExpires, resetToken, resetTokenExpires }: UserPrisma & { isVerified?: boolean; verificationToken?: string; mfaCode?: string; mfaExpires?: Date }) {
        return new User({
            id,
            username,
            firstName,
            lastName,
            email,
            password,
            role: role as Role,
            isVerified,
            verificationToken,
            mfaCode,
            mfaExpires,
            resetToken,
            resetTokenExpires
        });
    }
}