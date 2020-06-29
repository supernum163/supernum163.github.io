source("utils.R")
source("optimizer.R")


setRefClass(
  "Trainer",
  fields = c("network", "verbose", "x_train","t_train", "x_test", "t_test"
    "epochs", "batch_size", "evaluate_sample_num_per_epoch", "optimizer", 
    "train_size", "iter_per_epoch", "max_iter", "current_iter", "current_epoch", 
    "train_loss_list", "train_acc_list", "test_acc_list"
  ),
  methods = list(
    initialize = function(network, x_train, t_train, x_test, t_test,
      epochs = 20, mini_batch_size = 100,
      optimizer = 'SGD', optimizer_param = list(lr =:0.01), 
      evaluate_sample_num_per_epoch = None, verbose = TRUE
    ) {
      network <<- network
      x_train <<- x_train
      t_train <<- t_train
      x_test <<- x_test
      t_test <<- t_test
      train_size <<- dim(x_train)[0]
      batch_size <<- mini_batch_size
      # epochs表示回合，每回合执行一次大规模检验，iter_per_epoch为每回合需要循环的次数
      epochs <<- epochs
      evaluate_sample_num_per_epoch <<- evaluate_sample_num_per_epoch
      iter_per_epoch <<- max(train_size / mini_batch_size, 1)
      max_iter <<- floor(epochs * iter_per_epoch)
      current_iter <<- 0
      current_epoch <<- 0
      verbose <<- verbose
      optimizer <<- do.call[toupper(optimizer), optimizer_param)
      # 记录失误/准确率
      train_loss_list <<- numeric(0)
      train_acc_list <<- numeric(0)
      test_acc_list <<- numeric(0)
    },
    train = function() {
      for(i in 1:max_iter) {
        # 每回合随机抽取训练样本
        batch_mask <- sample(train_size, batch_size)
        x_batch <- x_train[batch_mask]
        t_batch <- t_train[batch_mask]
        # 学习过程，向前传递计算误差，向后传递更新参数
        grads <- network.gradient(x_batch, t_batch)
        optimizer.update(network.params, grads)
        # 计算损失
        loss <- network.loss(x_batch, t_batch)
        train_loss_list <<- append(train_loss_list, loss)
        if (verbose) {
          msg <- sprintf("训练集准确率： .2f%%", loss * 100)
          cat(msg, "    \r")
        }
        # 每进行一定次数的循环，进行一次整体预测
        if (current_iter % iter_per_epoch == 0) {
          current_epoch <<- current_epoch + 1
          if (evaluate_sample_num_per_epoch > 0) {
            t = evaluate_sample_num_per_epoch
            x_train_sample <- x_train[1:t]
            t_train_sample <- t_train[1:t]
            x_test_sample <- x_test[1:t]
            t_test_sample <- t_test[1:t]
          } else {
            x_train_sample <- x_train
            t_train_sample <- t_train
            x_test_sample <- x_test
            t_test_sample <- t_test
          }
          train_acc <- network.accuracy(x_train_sample, t_train_sample)
          test_acc <- network.accuracy(x_test_sample, t_test_sample)
          train_acc_list <<- append(train_acc_list, train_acc)
          test_acc_list <<- append(test_acc_list, test_acc)
          if (verbose) {
            msg <- sprintf("第 %d 回合，训练集准确率： .2f%%， 测试集准确率： .2f%%", 
              current_epoch, train_acc * 100, test_acc * 100
            )
            print(msg)
          }
        }
        current_iter <<- current_iter + 1
      }
      # 训练结束计算测试集上的准确率
      test_acc <- network.accuracy(x_test, t_test)
      if (verbose) {
        print("=============== 最终正误校验 ===============")
        msg <- sprintf("测试集准确率： .2f%%", test_acc * 100)
        print(msg)
      }
    }
  )
)

