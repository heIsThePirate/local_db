/**
 * React Starter Kit for Firebase
 * https://github.com/kriasoft/react-firebase-starter
 * Copyright (c) 2015-present Kriasoft | MIT License
 */

/* prettier-ignore */

exports.up = async db => {
  await db.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await db.raw('CREATE EXTENSION IF NOT EXISTS "hstore"');
  await db.raw("CREATE TYPE meetingstatus AS ENUM ('SCHEDULED', 'CANCELLED', 'COMPLETED')");
  await db.raw("CREATE TYPE cancelreason AS ENUM ('TEACHER_NOSHOW', 'STUDENT_FORFEIT', 'CANCELED_BY_TEACHER', 'CANCELED_BY_STUDENT', 'CANCELED_BY_ADMIN')");
  await db.raw("CREATE TYPE dayofweek AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN')");
  await db.raw("CREATE TYPE connection_status AS ENUM ('PENDING', 'APPROVED')");
  await db.raw("CREATE TYPE content_type AS ENUM ('TEXT', 'IMAGE')");

  await db.schema.createTable('users', table => {
    table.uuid('id').notNullable().defaultTo(db.raw('uuid_generate_v4()')).primary();
    table.string('username', 50).unique();
    table.string('email', 100);
    table.boolean('email_verified').notNullable().defaultTo(false);
    table.string('phone', 20);
    table.boolean('phone_verified').notNullable().defaultTo(false);
    table.string('display_name', 100);
    table.string('photo_url', 1000);
    table.string('time_zone', 50);
    table.boolean('is_registered').notNullable().defaultTo(false);
    table.boolean('is_admin').notNullable().defaultTo(false);
    table.boolean('is_teacher').notNullable().defaultTo(false);
    table.jsonb('settings').notNullable().defaultTo('{}');
    table.timestamps(false, true);
    table.timestamp('last_login_at').notNullable().defaultTo(db.fn.now());
    table.index(['email', 'email_verified']);
    table.index(['phone', 'phone_verified']);
  });

  await db.schema.createTable('teachers', table => {
    table.uuid('id').notNullable().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE').primary()
    table.string('headline', 100);
    table.string('location', 50);
    table.string('zip_code', 10);
    table.string('about', 2000);
    table.jsonb('links').notNullable().defaultTo('[]');
    table.integer('min_booking_notice').notNullable().defaultTo(24);
    table.integer('max_booking_notice').notNullable().defaultTo(24 * 30);
    table.string('teacher_status', 20);
    table.boolean('is_featured').notNullable().defaultTo(false);
    table.string('intro_video_url', 500);
    table.string('intro_video_thumbnail_url', 500);
    table.timestamp('applied_at');
    table.timestamp('approved_at');
    table.timestamp('last_login_at').notNullable().defaultTo(db.fn.now());
    table.timestamp('created_at').notNullable().defaultTo(db.fn.now());
  });

  await db.schema.createTable('teacher_experiences', table => {
    table.uuid('id').notNullable().defaultTo(db.raw('uuid_generate_v4()')).primary();
    table.uuid('teacher_id').notNullable().references('id').inTable('teachers').onDelete('CASCADE').onUpdate('CASCADE')
    table.string('position', 100);
    table.string('organization', 100);
    table.text('description', 2000)
    table.string('from_year')
    table.string('from_month')
    table.string('to_year')
    table.string('to_month')
    table.boolean('is_present').notNullable().defaultTo(false);
    table.timestamps(false, true);
  });

  await db.schema.createTable('teacher_educations', table => {
    table.uuid('id').notNullable().defaultTo(db.raw('uuid_generate_v4()')).primary();
    table.uuid('teacher_id').notNullable().references('id').inTable('teachers').onDelete('CASCADE').onUpdate('CASCADE');
    table.string('school', 100);
    table.string('degree', 100);
    table.string('field_of_study', 100);
    table.date('from');
    table.date('to');
    table.timestamps(false, true);
  });

  await db.schema.createTable('lessons', table => {
    table.uuid('id').notNullable().defaultTo(db.raw('uuid_generate_v4()')).primary();
    table.uuid('teacher_id').notNullable().references('id').inTable('teachers').onDelete('CASCADE').onUpdate('CASCADE').index();
    table.string('subject', 100).notNullable();
    table.text('expertise', 2000);
    table.jsonb('academic_level');
    table.jsonb('proficiency_level');
    table.jsonb('student_age_level');
    table.string('status', 50);
    table.boolean('is_primary').notNullable().defaultTo(false); // primary subject
    table.boolean('is_active').notNullable().defaultTo(true);
    table.unique(['teacher_id', 'subject']);
    table.timestamps(false, true);
  });

  await db.schema.createTable('lesson_packages', table => {
    table.uuid('id').notNullable().defaultTo(db.raw('uuid_generate_v4()')).primary();
    table.uuid('lesson_id').notNullable().references('id').inTable('lessons').onDelete('CASCADE').onUpdate('CASCADE').index();
    table.integer('number_of_lessons').notNullable().defaultTo(0);
    table.integer('each_lesson_duration').notNullable().defaultTo(0);
    table.integer('total_amount').notNullable().defaultTo(0);
    table.integer('number_of_purchases').notNullable().defaultTo(0);
    table.boolean('is_active').notNullable().defaultTo(true);
    table.unique(['lesson_id', 'number_of_lessons', 'each_lesson_duration']);
    table.timestamps(false, true);
  });

  await db.schema.createTable('user_tokens', table => {
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE');
    table.uuid('token_id').notNullable().primary();
    table.timestamp('created_at').notNullable().defaultTo(db.fn.now());
  });

  await db.schema.createTable('user_identities', table => {
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE');
    table.string('provider', 16).notNullable();
    table.string('provider_id', 36).notNullable();
    table.jsonb('profile').notNullable();
    table.jsonb('credentials').notNullable();
    table.timestamps(false, true);
    table.primary(['provider', 'provider_id']);
  });

  await db.schema.createTable('requests', table => {
    table.uuid('id').notNullable().defaultTo(db.raw('uuid_generate_v4()')).primary();
    table.uuid('author_id').notNullable().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE').index();
    table.string('text', 2000);
    table.timestamps(false, true);
  });

  await db.schema.createTable('responses', table => {
    table.uuid('id').notNullable().defaultTo(db.raw('uuid_generate_v4()')).primary();
    table.uuid('request_id').notNullable().references('id').inTable('requests').onDelete('CASCADE').onUpdate('CASCADE').index();
    table.uuid('author_id').notNullable().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE').index();
    table.string('text', 2000);
    table.integer('quote_20m');
    table.integer('quote_50m');
    table.timestamps(false, true);
  });

  await db.schema.createTable('teacher_availability_slots', table => {
    table.uuid('id').notNullable().defaultTo(db.raw('uuid_generate_v4()')).primary();
    table.uuid('teacher_id').notNullable().references('id').inTable('teachers').onDelete('CASCADE').onUpdate('CASCADE').index();
    table.specificType('day', 'dayofweek').notNullable();
    table.time('time').notNullable();
    table.string('time_zone', 50).notNullable();
    table.timestamps(false, true);
    table.unique(['teacher_id', 'day', 'time', 'time_zone']);
  });

  await db.schema.createTable('teacher_availability_exceptions', table => {
    table.uuid('id').notNullable().defaultTo(db.raw('uuid_generate_v4()')).primary();
    table.uuid('teacher_id').notNullable().references('id').inTable('teachers').onDelete('CASCADE').onUpdate('CASCADE').index();
    table.timestamp('from').notNullable();
    table.timestamp('to').notNullable();
    table.timestamps(false, true);
    table.unique(['teacher_id', 'from', 'to']);
  });

  await db.schema.createTable('teacher_application_status', table => {
    table.uuid('id').notNullable().references('id').inTable('teachers').onDelete('CASCADE').onUpdate('CASCADE').primary();
    table.string('lessons_status', 20).notNullable().defaultTo('Active');
    table.string('availability_status', 20).notNullable().defaultTo('Inactive');
    table.string('profile_info_status', 20).notNullable().defaultTo('Inactive');
    table.timestamps(false, true);
  });

  await db.schema.createTable('test_meetings', table => {
    table.uuid('id').notNullable().defaultTo(db.raw('uuid_generate_v4()')).primary();
    table.uuid('student_id').notNullable().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE').index();
    table.uuid('teacher_id').notNullable().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE').index();
    table.timestamp('start_time').notNullable();
    table.integer('duration');
    table.integer('grace_time');
    table.integer('over_time');
    table.integer('forfeit_time');
    table.timestamps(false, true);
  });

  await db.schema.createTable('meetings', table => {
    table.uuid('id').notNullable().defaultTo(db.raw('uuid_generate_v4()')).primary();
    table.uuid('student_id').notNullable().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE').index();
    table.uuid('teacher_id').notNullable().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE').index();
    table.timestamp('start_time').notNullable();
    table.integer('duration');
    table.string('room_sid', 50);
    table.string('composition_sid', 50);
    table.string('composition_status', 50);
    table.specificType('status', 'meetingstatus').notNullable().defaultTo('SCHEDULED');
    table.specificType('cancel_reason', 'cancelreason');
    table.string('cancel_reason_note', 1000);
    table.timestamp('teacher_join_time');
    table.timestamp('student_join_time');
    table.timestamps(false, true);
  });

  await db.schema.createTable('connections', table => {
    table.uuid('id').notNullable().defaultTo(db.raw('uuid_generate_v4()')).primary();
    table.uuid('student_id').notNullable().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE').index();
    table.uuid('teacher_id').notNullable().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE').index();
    table.string('last_message_id', 100);
    table.string('last_message_text', 2000);
    table.uuid('last_message_author_id');
    table.timestamp('last_message_created_at');
    table.specificType('status', 'connection_status').notNullable().defaultTo('PENDING');
    table.integer('student_unread_message_count').notNullable().defaultTo(0);
    table.integer('teacher_unread_message_count').notNullable().defaultTo(0);
    table.timestamps(false, true);
    table.unique(['student_id', 'teacher_id']);
  });

  await db.schema.createTable('messages', table => {
    table.uuid('id').notNullable().defaultTo(db.raw('uuid_generate_v4()')).primary();
    table.uuid('connection_id').notNullable().references('id').inTable('connections').onDelete('CASCADE').onUpdate('CASCADE').index();
    table.uuid('author_id').notNullable().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE').index();
    table.text('content').notNullable();
    table.specificType('content_type', 'content_type').notNullable().defaultTo('TEXT');
    table.timestamps(false, true);
  });

  await db.schema.createTable('posts', table => {
    table.uuid('id').notNullable().defaultTo(db.raw('uuid_generate_v4()')).primary();
    table.uuid('author_id').notNullable().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE').index();
    table.string('image_url', 100);
    table.string('canonical_url', 100);
    table.string('slug', 108).notNullable(); // title + short id
    table.string('title', 100);
    table.string('subtitle', 140);
    table.string('description', 250);
    table.jsonb('content');
    table.jsonb('tags').notNullable().defaultTo('[]');
    table.boolean('published').notNullable().defaultTo(false);
    table.boolean('featured').notNullable().defaultTo(false);
    table.integer('views_count').notNullable().defaultTo(0);
    table.timestamp('published_at');
    table.timestamps(false, true);
  });

  await db.raw('CREATE INDEX posts_tags_index ON posts USING GIN (tags)')

  await db.schema.createTable('room_statuses', table => {
    table.string('room_sid', 50);
    table.jsonb('status').notNullable();
    table.timestamps(false, true);
  });

  await db.schema.createTable('utils', table => {
    table.string('key').notNullable().primary();
    table.jsonb('value');
    table.timestamps(false, true);
  });
};

exports.down = async db => {
  await db.schema.dropTableIfExists('teacher_application_status');
  await db.schema.dropTableIfExists('lesson_packages');
  await db.schema.dropTableIfExists('lessons');
  await db.schema.dropTableIfExists('teacher_experiences');
  await db.schema.dropTableIfExists('teacher_educations');
  await db.schema.dropTableIfExists('room_statuses');
  await db.raw('DROP INDEX IF EXISTS posts_tags_index');
  await db.schema.dropTableIfExists('posts');
  await db.schema.dropTableIfExists('messages');
  await db.schema.dropTableIfExists('connections');
  await db.schema.dropTableIfExists('meetings');
  await db.schema.dropTableIfExists('test_meetings');
  await db.schema.dropTableIfExists('teacher_availability_exceptions');
  await db.schema.dropTableIfExists('teacher_availability_slots');
  await db.schema.dropTableIfExists('responses');
  await db.schema.dropTableIfExists('requests');
  await db.schema.dropTableIfExists('user_identities');
  await db.schema.dropTableIfExists('user_tokens');
  await db.schema.dropTableIfExists('teachers');
  await db.schema.dropTableIfExists('users');
  await db.schema.dropTableIfExists('utils');

  await db.raw('DROP TYPE IF EXISTS content_type');
  await db.raw('DROP TYPE IF EXISTS connection_status');
  await db.raw('DROP TYPE IF EXISTS dayofweek');
  await db.raw('DROP TYPE IF EXISTS meetingstatus');
  await db.raw('DROP TYPE IF EXISTS cancelreason');
};
