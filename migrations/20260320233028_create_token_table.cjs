
exports.up = function(knex) {
  return knex.schema.createTable('tokens', function (table) {
    table.increments();
    table.integer('user_id').unsigned().references('id').inTable('users');
    table.string('token');
    table.boolean('expired').defaultTo(false);
    table.timestamps(true, true);
    table.index(['token'], 'idx_token', {
      indexType: 'FULLTEXT',
    })
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('tokens');
};
