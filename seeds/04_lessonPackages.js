const lessonPackagesLocal = require('../data/lessonPackagesLocal');

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('lesson_packages').del()
    .then(function () {
      // Inserts seed entries
      return knex('lesson_packages').insert(lessonPackagesLocal);
    });
};
