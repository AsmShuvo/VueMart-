import Swal from 'sweetalert2'

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer
    toast.onmouseleave = Swal.resumeTimer
  }
})

export function toastSuccess(msg) {
  Toast.fire({ icon: 'success', title: msg })
}

export function toastError(msg) {
  Toast.fire({ icon: 'error', title: msg })
}

export function toastInfo(msg) {
  Toast.fire({ icon: 'info', title: msg })
}

export function confirmDialog(title, text = '') {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#6366f1',
    cancelButtonColor: '#ef4444',
    confirmButtonText: 'Yes, do it!',
    cancelButtonText: 'Cancel',
    background: '#fff',
    customClass: {
      popup: 'rounded-2xl',
    }
  })
}

export function successDialog(title, text = '') {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonColor: '#6366f1',
    customClass: {
      popup: 'rounded-2xl',
    }
  })
}

export default Swal
