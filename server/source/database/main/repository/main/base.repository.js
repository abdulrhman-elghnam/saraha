export const findById = async ({ id, options = {}, select, model } = {}) => {
  let query = model.findById(id).select(select || '');

  if (options.populate) {
    query = query.populate(options.populate);
  }

  if (options.lean) {
    query = query.lean(true);
  }

  return await query.exec();
};

export const findOne = async ({ filter = {}, options = {}, select, model } = {}) => {
  let query = model.findOne(filter).select(select || '');

  if (options.populate) {
    query = query.populate(options.populate);
  }

  if (options.lean) {
    query = query.lean(true);
  }

  return await query.exec();
};

export const find = async ({ filter = {}, options = {}, select, model } = {}) => {
  let query = model.find(filter).select(select || '');

  if (options.populate) {
    query = query.populate(options.populate);
  }

  if (options.skip !== undefined) {
    query = query.skip(options.skip);
  }

  if (options.limit !== undefined) {
    query = query.limit(options.limit);
  }

  if (options.sort) {
    query = query.sort(options.sort);
  }

  if (options.lean) {
    query = query.lean(true);
  }

  return await query.exec();
};

export const paginate = async ({
  filter = {},
  options = {},
  select,
  page = 'all',
  size = 5,
  model,
} = {}) => {
  let docsCount;
  let pages;
  let currentPage;

  if (page !== 'all') {
    currentPage = Math.max(1, Math.floor(Number(page) || 1));

    const limit = Math.max(1, Math.floor(Number(size) || 5));

    const skip = (currentPage - 1) * limit;

    options = {
      ...options,
      limit,
      skip,
    };

    docsCount = await model.countDocuments(filter);

    pages = Math.ceil(docsCount / limit);
  }

  const result = await find({
    model,
    filter,
    select,
    options,
  });

  return {
    docsCount,
    limit: options.limit,
    pages,
    currentPage,
    result,
  };
};

export const create = async ({ data = {}, options = {}, model } = {}) =>
  await model.create([data], options);

export const insertMany = async ({ data, options = {}, model } = {}) =>
  await model.insertMany(data, options);

export const updateOne = async ({ filter = {}, update, options = {}, model } = {}) => {
  if (Array.isArray(update)) {
    const pipeline = [
      ...update,
      {
        $set: {
          __v: {
            $add: ['$__v', 1],
          },
        },
      },
    ];

    return await model.updateOne(filter, pipeline, {
      ...options,
      runValidators: true,
      updatePipeline: true,
    });
  }

  return await model.updateOne(
    filter,
    {
      ...update,
      $inc: {
        ...(update.$inc || {}),
        __v: 1,
      },
    },
    {
      ...options,
      runValidators: true,
    }
  );
};

export const findOneAndUpdate = async ({ filter = {}, update, options = {}, model } = {}) => {
  if (Array.isArray(update)) {
    const pipeline = [
      ...update,
      {
        $set: {
          __v: {
            $add: ['$__v', 1],
          },
        },
      },
    ];

    return await model.findOneAndUpdate(filter, pipeline, {
      new: true,
      runValidators: true,
      ...options,
      updatePipeline: true,
    });
  }

  return await model.findOneAndUpdate(
    filter,
    {
      ...update,
      $inc: {
        ...(update.$inc || {}),
        __v: 1,
      },
    },
    {
      new: true,
      runValidators: true,
      ...options,
    }
  );
};

export const findByIdAndUpdate = async ({ id, update, options = {}, model } = {}) => {
  const finalUpdate = Array.isArray(update)
    ? [
      ...update,
      {
        $set: {
          __v: {
            $add: ['$__v', 1],
          },
        },
      },
    ]
    : {
      ...update,
      $inc: {
        ...(update.$inc || {}),
        __v: 1,
      },
    };

  return await model.findByIdAndUpdate(id, finalUpdate, {
    new: true,
    runValidators: true,
    ...options,
    ...(Array.isArray(update) ? { updatePipeline: true } : {}),
  });
};

export const deleteOne = async ({ filter = {}, model } = {}) => {
  return await model.deleteOne(filter);
};

export const deleteMany = async ({ filter = {}, model } = {}) => {
  return await model.deleteMany(filter);
};

export const findOneAndDelete = async ({ filter = {}, options = {}, model } = {}) => {
  return await model.findOneAndDelete(filter, options);
};
