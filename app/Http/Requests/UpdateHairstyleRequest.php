<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHairstyleRequest extends FormRequest
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
            'name' => ['sometimes', 'required', 'string', 'max:64'],
            'image_url' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'status' => ['sometimes', 'required', 'string', 'in:active,inactive'],
            'quantity' => ['sometimes', 'required', 'integer', 'min:0', 'max:999999'],
            'fit_score' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'accent' => ['sometimes', 'string', 'in:slate,amber,rose,emerald,violet,zinc'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (!$this->exists('image_url')) {
            return;
        }

        $img = $this->input('image_url');
        $normalizedImg = null;
        if (is_string($img) && trim($img) !== '') {
            $normalizedImg = trim($img);
        }

        $this->merge([
            'image_url' => $normalizedImg,
        ]);
    }
}
