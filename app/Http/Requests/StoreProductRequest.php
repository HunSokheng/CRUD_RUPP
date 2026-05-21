<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:64'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'price' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'string', 'in:active,inactive'],
            'quantity' => ['required', 'integer', 'min:0', 'max:999999'],
            'fit_score' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'accent' => ['sometimes', 'string', 'in:slate,amber,rose,emerald,violet,zinc'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $img = $this->input('image_url');
        $normalizedImg = null;
        if (is_string($img) && trim($img) !== '') {
            $normalizedImg = trim($img);
        }

        $this->merge([
            'fit_score' => $this->input('fit_score', 50),
            'accent' => $this->input('accent', 'zinc'),
            'image_url' => $normalizedImg,
        ]);
    }
}
