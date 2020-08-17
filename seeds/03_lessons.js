const lessonsLocal = require('../data/lessonsLocal');

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('lessons').del()
    .then(function () {
      // Inserts seed entries
      return knex('lessons').insert(lessonsLocal);
    });
};
