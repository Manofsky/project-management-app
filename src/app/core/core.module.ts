import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { TranslateModule } from '@ngx-translate/core';

import { UserTokenService } from './services/user-token.service';
import { UserStateService } from './services/user-state.service';
import { UsersRestApiService } from './services/users-rest-api.service';

import { ErrorHandlerInterceptor } from './interceptors/error-handler.interceptor';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ErrorDialogComponent } from './components/error-dialog/error-dialog.component';

@NgModule({
  declarations: [NotFoundComponent, ErrorDialogComponent],
  imports: [CommonModule, TranslateModule],
  providers: [
    UserTokenService,
    UserStateService,
    UsersRestApiService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorHandlerInterceptor,
      multi: true,
    },
  ],
})
export class CoreModule {}
