<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Subject portrait
    |--------------------------------------------------------------------------
    |
    | Point this to your portrait asset (e.g. /images/subject.jpg in public/)
    | or a fully qualified URL. Override with HAIRSTUDIO_PORTRAIT in .env.
    |
    */
    'portrait_url' => env(
        'HAIRSTUDIO_PORTRAIT',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=960&q=82'
    ),
];
