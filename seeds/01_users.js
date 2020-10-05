const usersLocal = require('../data/usersLocal');

exports.seed = function(knex) {
  return knex('users')
    .del()
    .then(function() {
      return knex('users').insert(usersLocal);
    });
};
