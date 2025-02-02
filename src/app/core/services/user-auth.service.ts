import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import jwtDecode from 'jwt-decode';
import { BehaviorSubject, EMPTY, Observable, Subscription } from 'rxjs';

import { RoutePaths } from 'src/app/shared/constants';
import { AuthApiService } from 'src/app/auth/services/auth.service';
import { UserStateService } from './user-state.service';
import { UserTokenService } from './user-token.service';
import { UserResponse, UsersApiService } from './users-api.service';
import { User, UserData } from '../interfaces/user.interface';

@Injectable()
export class UserAuthenticationService {
  private isAuthUser$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false,
  );

  public get isAuth$(): Observable<boolean> {
    return this.isAuthUser$.asObservable();
  }

  public get isAuth(): boolean {
    return this.isAuthUser$.getValue();
  }

  constructor(
    private authApiService: AuthApiService,
    private userTokenService: UserTokenService,
    private usersApiService: UsersApiService,
    private userStateService: UserStateService,
    private router: Router,
  ) {}

  public initAuth(): Subscription {
    const userToken = this.userTokenService.getToken();
    if (!userToken) return EMPTY.subscribe();
    this.isAuthUser$.next(true);
    return this.authUserByToken(userToken).subscribe((user) => {
      this.authUser(user);
    });
  }

  public signIn({ login, password }: Omit<User, 'id' | 'name'>) {
    this.authApiService.signIn(login!, password!).subscribe(({ token }) => {
      this.userTokenService.setToken(token);
      this.authUserByToken(token).subscribe((user) => {
        this.authUser(user);
        this.router.navigate([RoutePaths.boards]);
      });
    });
  }

  public signUp({ name, login, password }: Omit<User, 'id'>) {
    this.authApiService
      .signUp(name!, login!, password!)
      .subscribe((newUser: UserData) => {
        const signInRequest = this.authApiService.signIn(
          newUser.login,
          password,
        );

        signInRequest.subscribe(({ token }) => {
          this.userTokenService.setToken(token);
          this.authUser(newUser);
          this.router.navigate([RoutePaths.boards]);
        });
      });
  }

  public logout(): void {
    this.userTokenService.removeToken();
    this.userStateService.removeUser();
    this.isAuthUser$.next(false);

    this.router.navigateByUrl(RoutePaths.welcome);
  }

  private authUserByToken(token: string): Observable<UserResponse> {
    // return error on not valid user
    const { userId } = jwtDecode<{ userId: string; login: string }>(token);
    if (userId) {
      return this.usersApiService.getById(userId);
    }
    return EMPTY;
  }

  private authUser(user: UserData): void {
    this.userStateService.init(user);
    this.isAuthUser$.next(true);
  }
}
