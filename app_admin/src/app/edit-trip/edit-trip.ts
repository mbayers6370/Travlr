import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Trip } from '../models/trip';
import { TripData } from '../services/trip-data';

@Component({
  selector: 'app-edit-trip',
  imports: [CommonModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './edit-trip.html',
  styleUrl: './edit-trip.css'
})
export class EditTrip implements OnInit {
  readonly tripForm;
  tripCode = '';
  errorMessage = '';
  imageErrorMessage = '';
  imagePreviewUrl = '';
  imageUploading = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private tripData: TripData
  ) {
    this.tripForm = this.formBuilder.nonNullable.group({
      code: [{ value: '', disabled: true }],
      name: ['', Validators.required],
      length: ['', Validators.required],
      start: ['', Validators.required],
      resort: ['', Validators.required],
      perPerson: ['', Validators.required],
      image: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.tripCode = this.route.snapshot.paramMap.get('tripCode') ?? '';
    if (!this.tripCode) {
      this.errorMessage = 'No trip code was provided.';
      return;
    }

    this.tripData.getTrip(this.tripCode).subscribe({
      next: (trip) => {
        this.tripForm.patchValue({ ...trip, start: this.toDateInputValue(trip.start) });
        this.imagePreviewUrl = this.tripData.imageUrl(trip.image);
      },
      error: (error) => this.errorMessage = error.error?.message ?? 'Unable to load trip.'
    });
  }

  saveTrip(): void {
    if (this.tripForm.invalid) {
      this.tripForm.markAllAsTouched();
      return;
    }

    const formData = { ...this.tripForm.getRawValue(), code: this.tripCode } as Trip;
    this.tripData.updateTrip(this.tripCode, formData).subscribe({
      next: () => this.router.navigate(['/']),
      error: (error) => this.errorMessage = error.error?.message ?? 'Unable to update trip.'
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

  private toDateInputValue(value: string): string {
    return value ? new Date(value).toISOString().slice(0, 10) : '';
  }
}
