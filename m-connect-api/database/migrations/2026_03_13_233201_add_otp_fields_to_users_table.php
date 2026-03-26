<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddOtpFieldsToUsersTable extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'email_verified_at')) {
                $table->timestamp('email_verified_at')->nullable();
            }

            if (!Schema::hasColumn('users', 'verification_otp')) {
                $table->string('verification_otp')->nullable()->index();
            }

            if (!Schema::hasColumn('users', 'verification_otp_expires_at')) {
                $table->timestamp('verification_otp_expires_at')->nullable();
            }
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'email_verified_at')) {
                $table->dropColumn('email_verified_at');
            }

            if (Schema::hasColumn('users', 'verification_otp')) {
                $table->dropColumn('verification_otp');
            }

            if (Schema::hasColumn('users', 'verification_otp_expires_at')) {
                $table->dropColumn('verification_otp_expires_at');
            }
        });
    }
}