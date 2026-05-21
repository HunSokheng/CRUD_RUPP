<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Subject portrait
    |--------------------------------------------------------------------------
    |
    | Point this to your portrait asset (e.g. /images/subject.jpg in public/)
    | or a fully qualified URL. Override with PRODUCTS_PORTRAIT in .env.
    |
    */
    'portrait_url' => env(
        'PRODUCTS_PORTRAIT',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=960&q=82'
    ),
];
