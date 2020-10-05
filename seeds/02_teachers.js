const teachersLocal = require('../data/teachersLocal');

exports.seed = function(knex) {
  return knex('teachers')
    .del()
    .then(function() {
      return knex('teachers').insert(teachersLocal);
    });
};
