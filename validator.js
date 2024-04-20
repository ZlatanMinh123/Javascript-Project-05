// Đối tượng `Validator`
function Validator(options) {
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  var selectorRule = {};

  // Hàm thực hiện validate
  function validate(inputElement, rule) {
    var errorMessage;
    var inputParent = getParent(inputElement, options.formGroupSelector);
    var errorElement = inputParent.querySelector(options.errorSelector);

    var rules = selectorRule[rule.selector];
    // Lặp qua từng rule và kiểm tra, nếu có lỗi thì dừng
    for (i = 0; i < rules.length; i++) {
      switch (inputElement.type) {
        case "radio":
        case "checkbox":
          errorMessage = rules[i](formElement.querySelector(rule.selector + ":checked"));
          break;

        default:
          errorMessage = rules[i](inputElement.value);
      }

      if (errorMessage) {
        break;
      }
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      inputParent.classList.add("invalid");
    } else {
      errorElement.innerText = "";
      inputParent.classList.remove("invalid");
    }

    return !errorMessage;
  }

  // Lấy element của form cần validate
  var formElement = document.querySelector(options.form);
  if (formElement) {
    // Khi Submit form
    formElement.onsubmit = function (e) {
      e.preventDefault();
      var isFormValid = true;

      // Lặp qua từng rules và validate
      options.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector);
        var isValid = validate(inputElement, rule);
        if (!isValid) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        // Trường hợp submit với javascript
        if (typeof options.onSubmit === "function") {
          var enableInputs = formElement.querySelectorAll("[name]");
          var formValues = Array.from(enableInputs).reduce(function (values, input) {
            switch (input.type) {
              case "radio":
              case "checkbox":
                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                break;
              default:
                values[input.name] = input.value;
            }

            return values;
          }, {});
          options.onSubmit(formValues);
        }
        //  Trường hợp submit với hành vi mặc định
        else {
          formElement.submit();
        }
      }
    };

    // Lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur, input,...)
    options.rules.forEach(function (rule) {
      // Lưu lại các rule cho mỗi input
      if (Array.isArray(selectorRule[rule.selector])) {
        selectorRule[rule.selector].push(rule.test);
      } else {
        selectorRule[rule.selector] = [rule.test];
      }

      var inputElements = formElement.querySelectorAll(rule.selector);
      Array.from(inputElements).forEach(function (inputElement) {
        // Xử lý trường hợp khi blur khỏi Input
        inputElement.onblur = function () {
          validate(inputElement, rule);
        };
        // Xử lý mỗi khi người dùng nhập vào input
        inputElement.oninput = function () {
          var inputParent = getParent(inputElement, options.formGroupSelector);
          var errorElement = inputParent.querySelector(options.errorSelector);
          errorElement.innerText = "";
          inputParent.classList.remove("invalid");
        };
      });
    });
  }
}

// Định nghĩa rules
// Kiểm tra xem người dùng đã nhập chưa
Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return value ? undefined : message || "Vui lòng nhập thông tin";
    },
  };
};
// Kiểm tra xem đây có phải là email không
Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : message || "Trường này phải là email";
    },
  };
};

Validator.minLength = function (selector, min, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự`;
    },
  };
};

Validator.isConfirmed = function (selector, getConfirmValue, message) {
  return {
    selector: selector,
    test: function (value) {
      return value === getConfirmValue() ? undefined : message || "Giá trị nhập vào không chính xác";
    },
  };
};
