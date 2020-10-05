const storiesLocal = require('../data/storiesLocal');

exports.seed = function(knex) {
  return knex('stories')
    .del()
    .then(function() {
      return knex('stories').insert(storiesLocal);
    });
};
