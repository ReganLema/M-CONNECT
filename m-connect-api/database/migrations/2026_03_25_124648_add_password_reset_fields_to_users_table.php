// database/migrations/xxxx_xx_xx_xxxxxx_add_password_reset_fields_to_users_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('reset_password_otp')->nullable();
            $table->timestamp('reset_password_otp_expires_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['reset_password_otp', 'reset_password_otp_expires_at']);
        });
    }
};