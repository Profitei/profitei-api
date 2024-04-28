import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Module({
  providers: [FirebaseService],
  exports: [FirebaseService], // Export FirebaseService so it can be used elsewhere in the app
})
export class FirebaseModule {}
