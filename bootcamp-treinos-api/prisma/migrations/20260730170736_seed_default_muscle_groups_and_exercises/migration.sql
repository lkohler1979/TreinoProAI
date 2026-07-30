WITH inserted_groups AS (
  INSERT INTO "MuscleGroup" (id, name, "createdAt", "updatedAt") VALUES
    (gen_random_uuid(), 'Peito', now(), now()),
    (gen_random_uuid(), 'Costas', now(), now()),
    (gen_random_uuid(), 'Pernas', now(), now()),
    (gen_random_uuid(), 'Ombros', now(), now()),
    (gen_random_uuid(), 'Bíceps', now(), now()),
    (gen_random_uuid(), 'Tríceps', now(), now()),
    (gen_random_uuid(), 'Abdômen', now(), now()),
    (gen_random_uuid(), 'Glúteos', now(), now()),
    (gen_random_uuid(), 'Panturrilha', now(), now())
  RETURNING id, name
)
INSERT INTO "ExerciseTemplate" (id, name, "muscleGroupId", "createdAt", "updatedAt")
SELECT gen_random_uuid(), exercise.name, inserted_groups.id, now(), now()
FROM inserted_groups
JOIN (VALUES
  ('Peito', 'Supino Reto'),
  ('Peito', 'Supino Inclinado'),
  ('Peito', 'Supino Declinado'),
  ('Peito', 'Crucifixo'),
  ('Peito', 'Crossover'),
  ('Peito', 'Flexão de Braço'),

  ('Costas', 'Puxada Frente'),
  ('Costas', 'Puxada Alta'),
  ('Costas', 'Remada Curvada'),
  ('Costas', 'Remada Cavalinho'),
  ('Costas', 'Levantamento Terra'),
  ('Costas', 'Barra Fixa'),

  ('Pernas', 'Agachamento Livre'),
  ('Pernas', 'Leg Press'),
  ('Pernas', 'Cadeira Extensora'),
  ('Pernas', 'Cadeira Flexora'),
  ('Pernas', 'Afundo'),
  ('Pernas', 'Stiff'),

  ('Ombros', 'Desenvolvimento Militar'),
  ('Ombros', 'Elevação Lateral'),
  ('Ombros', 'Elevação Frontal'),
  ('Ombros', 'Remada Alta'),
  ('Ombros', 'Crucifixo Invertido'),

  ('Bíceps', 'Rosca Direta'),
  ('Bíceps', 'Rosca Alternada'),
  ('Bíceps', 'Rosca Scott'),
  ('Bíceps', 'Rosca Martelo'),

  ('Tríceps', 'Tríceps Corda'),
  ('Tríceps', 'Tríceps Testa'),
  ('Tríceps', 'Mergulho no Banco'),
  ('Tríceps', 'Tríceps Francês'),

  ('Abdômen', 'Abdominal Supra'),
  ('Abdômen', 'Prancha'),
  ('Abdômen', 'Abdominal Infra'),
  ('Abdômen', 'Elevação de Pernas'),

  ('Glúteos', 'Elevação Pélvica'),
  ('Glúteos', 'Cadeira Abdutora'),
  ('Glúteos', 'Coice na Polia'),

  ('Panturrilha', 'Panturrilha em Pé'),
  ('Panturrilha', 'Panturrilha Sentado')
) AS exercise(group_name, name) ON exercise.group_name = inserted_groups.name;
