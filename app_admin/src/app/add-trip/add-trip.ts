import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TripData } from '../services/trip-data';
import { Trip } from '../models/trip';

@Component({
  selector: 'app-add-trip',
  imports: [CommonModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './add-trip.html',
  styleUrl: './add-trip.css',
})
export class AddTrip {
  readonly tripForm;
  errorMessage = '';
  imageErrorMessage = '';
  imagePreviewUrl = '';
  imageUploading = false;

  constructor(
    private formBuilder: FormBuilder,
    private tripData: TripData,
    private router: Router
  ) {
    this.tripForm = this.formBuilder.nonNullable.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      length: ['', Validators.required],
      start: ['', Validators.required],
      resort: ['', Validators.required],
      perPerson: ['', Validators.required],
      image: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  saveTrip(): void {
    if (this.tripForm.invalid) {
      this.tripForm.markAllAsTouched();
      return;
    }

    this.tripData.addTrip(this.tripForm.getRawValue() as Trip).subscribe({
      next: () => this.router.navigate(['/']),
      error: (error) => this.errorMessage = error.error?.message ?? 'Unable to create trip.'
    });
  }

  cancel(): void {
    this.router.navigate(['/']);
  }

  onImageSelected(event: Event): void {
    const image = (event.target as HTMLInputElement).files?.[0];
    if (!image) {
      return;
    }

    this.imageUploading = true;
    this.imageErrorMessage = '';
    this.tripData.uploadTripImage(image).subscribe({
      next: ({ filename }) => {
        this.tripForm.controls.image.setValue(filename);
        this.imagePreviewUrl = this.tripData.imageUrl(filename);
        this.imageUploading = false;
      },
      error: (error) => {
        this.imageErrorMessage = error.error?.message ?? 'Unable to upload image.';
        this.imageUploading = false;
      }
    });
  }
}
